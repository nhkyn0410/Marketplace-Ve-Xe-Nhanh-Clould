// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fare_create_input_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const FareCreateInputDtoStatusEnum _$fareCreateInputDtoStatusEnum_ACTIVE =
    const FareCreateInputDtoStatusEnum._('ACTIVE');
const FareCreateInputDtoStatusEnum _$fareCreateInputDtoStatusEnum_INACTIVE =
    const FareCreateInputDtoStatusEnum._('INACTIVE');

FareCreateInputDtoStatusEnum _$fareCreateInputDtoStatusEnumValueOf(
    String name) {
  switch (name) {
    case 'ACTIVE':
      return _$fareCreateInputDtoStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$fareCreateInputDtoStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<FareCreateInputDtoStatusEnum>
    _$fareCreateInputDtoStatusEnumValues =
    BuiltSet<FareCreateInputDtoStatusEnum>(const <FareCreateInputDtoStatusEnum>[
  _$fareCreateInputDtoStatusEnum_ACTIVE,
  _$fareCreateInputDtoStatusEnum_INACTIVE,
]);

Serializer<FareCreateInputDtoStatusEnum>
    _$fareCreateInputDtoStatusEnumSerializer =
    _$FareCreateInputDtoStatusEnumSerializer();

class _$FareCreateInputDtoStatusEnumSerializer
    implements PrimitiveSerializer<FareCreateInputDtoStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[FareCreateInputDtoStatusEnum];
  @override
  final String wireName = 'FareCreateInputDtoStatusEnum';

  @override
  Object serialize(Serializers serializers, FareCreateInputDtoStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  FareCreateInputDtoStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      FareCreateInputDtoStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$FareCreateInputDto extends FareCreateInputDto {
  @override
  final FareCreateInputDtoStatusEnum status;
  @override
  final String? note;
  @override
  final BuiltList<FareCreateInputDtoRulesInner> rules;
  @override
  final String routeId;

  factory _$FareCreateInputDto(
          [void Function(FareCreateInputDtoBuilder)? updates]) =>
      (FareCreateInputDtoBuilder()..update(updates))._build();

  _$FareCreateInputDto._(
      {required this.status,
      this.note,
      required this.rules,
      required this.routeId})
      : super._();
  @override
  FareCreateInputDto rebuild(
          void Function(FareCreateInputDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  FareCreateInputDtoBuilder toBuilder() =>
      FareCreateInputDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FareCreateInputDto &&
        status == other.status &&
        note == other.note &&
        rules == other.rules &&
        routeId == other.routeId;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jc(_$hash, rules.hashCode);
    _$hash = $jc(_$hash, routeId.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'FareCreateInputDto')
          ..add('status', status)
          ..add('note', note)
          ..add('rules', rules)
          ..add('routeId', routeId))
        .toString();
  }
}

class FareCreateInputDtoBuilder
    implements Builder<FareCreateInputDto, FareCreateInputDtoBuilder> {
  _$FareCreateInputDto? _$v;

  FareCreateInputDtoStatusEnum? _status;
  FareCreateInputDtoStatusEnum? get status => _$this._status;
  set status(FareCreateInputDtoStatusEnum? status) => _$this._status = status;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  ListBuilder<FareCreateInputDtoRulesInner>? _rules;
  ListBuilder<FareCreateInputDtoRulesInner> get rules =>
      _$this._rules ??= ListBuilder<FareCreateInputDtoRulesInner>();
  set rules(ListBuilder<FareCreateInputDtoRulesInner>? rules) =>
      _$this._rules = rules;

  String? _routeId;
  String? get routeId => _$this._routeId;
  set routeId(String? routeId) => _$this._routeId = routeId;

  FareCreateInputDtoBuilder() {
    FareCreateInputDto._defaults(this);
  }

  FareCreateInputDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _note = $v.note;
      _rules = $v.rules.toBuilder();
      _routeId = $v.routeId;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FareCreateInputDto other) {
    _$v = other as _$FareCreateInputDto;
  }

  @override
  void update(void Function(FareCreateInputDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FareCreateInputDto build() => _build();

  _$FareCreateInputDto _build() {
    _$FareCreateInputDto _$result;
    try {
      _$result = _$v ??
          _$FareCreateInputDto._(
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'FareCreateInputDto', 'status'),
            note: note,
            rules: rules.build(),
            routeId: BuiltValueNullFieldError.checkNotNull(
                routeId, r'FareCreateInputDto', 'routeId'),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'rules';
        rules.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'FareCreateInputDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
