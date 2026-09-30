// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fare_update_input_dto.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const FareUpdateInputDtoStatusEnum _$fareUpdateInputDtoStatusEnum_ACTIVE =
    const FareUpdateInputDtoStatusEnum._('ACTIVE');
const FareUpdateInputDtoStatusEnum _$fareUpdateInputDtoStatusEnum_INACTIVE =
    const FareUpdateInputDtoStatusEnum._('INACTIVE');

FareUpdateInputDtoStatusEnum _$fareUpdateInputDtoStatusEnumValueOf(
    String name) {
  switch (name) {
    case 'ACTIVE':
      return _$fareUpdateInputDtoStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$fareUpdateInputDtoStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<FareUpdateInputDtoStatusEnum>
    _$fareUpdateInputDtoStatusEnumValues =
    BuiltSet<FareUpdateInputDtoStatusEnum>(const <FareUpdateInputDtoStatusEnum>[
  _$fareUpdateInputDtoStatusEnum_ACTIVE,
  _$fareUpdateInputDtoStatusEnum_INACTIVE,
]);

Serializer<FareUpdateInputDtoStatusEnum>
    _$fareUpdateInputDtoStatusEnumSerializer =
    _$FareUpdateInputDtoStatusEnumSerializer();

class _$FareUpdateInputDtoStatusEnumSerializer
    implements PrimitiveSerializer<FareUpdateInputDtoStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[FareUpdateInputDtoStatusEnum];
  @override
  final String wireName = 'FareUpdateInputDtoStatusEnum';

  @override
  Object serialize(Serializers serializers, FareUpdateInputDtoStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  FareUpdateInputDtoStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      FareUpdateInputDtoStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$FareUpdateInputDto extends FareUpdateInputDto {
  @override
  final FareUpdateInputDtoStatusEnum status;
  @override
  final String? note;
  @override
  final BuiltList<FareCreateInputDtoRulesInner> rules;

  factory _$FareUpdateInputDto(
          [void Function(FareUpdateInputDtoBuilder)? updates]) =>
      (FareUpdateInputDtoBuilder()..update(updates))._build();

  _$FareUpdateInputDto._({required this.status, this.note, required this.rules})
      : super._();
  @override
  FareUpdateInputDto rebuild(
          void Function(FareUpdateInputDtoBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  FareUpdateInputDtoBuilder toBuilder() =>
      FareUpdateInputDtoBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FareUpdateInputDto &&
        status == other.status &&
        note == other.note &&
        rules == other.rules;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jc(_$hash, rules.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'FareUpdateInputDto')
          ..add('status', status)
          ..add('note', note)
          ..add('rules', rules))
        .toString();
  }
}

class FareUpdateInputDtoBuilder
    implements Builder<FareUpdateInputDto, FareUpdateInputDtoBuilder> {
  _$FareUpdateInputDto? _$v;

  FareUpdateInputDtoStatusEnum? _status;
  FareUpdateInputDtoStatusEnum? get status => _$this._status;
  set status(FareUpdateInputDtoStatusEnum? status) => _$this._status = status;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  ListBuilder<FareCreateInputDtoRulesInner>? _rules;
  ListBuilder<FareCreateInputDtoRulesInner> get rules =>
      _$this._rules ??= ListBuilder<FareCreateInputDtoRulesInner>();
  set rules(ListBuilder<FareCreateInputDtoRulesInner>? rules) =>
      _$this._rules = rules;

  FareUpdateInputDtoBuilder() {
    FareUpdateInputDto._defaults(this);
  }

  FareUpdateInputDtoBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _status = $v.status;
      _note = $v.note;
      _rules = $v.rules.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FareUpdateInputDto other) {
    _$v = other as _$FareUpdateInputDto;
  }

  @override
  void update(void Function(FareUpdateInputDtoBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FareUpdateInputDto build() => _build();

  _$FareUpdateInputDto _build() {
    _$FareUpdateInputDto _$result;
    try {
      _$result = _$v ??
          _$FareUpdateInputDto._(
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'FareUpdateInputDto', 'status'),
            note: note,
            rules: rules.build(),
          );
    } catch (_) {
      late String _$failedField;
      try {
        _$failedField = 'rules';
        rules.build();
      } catch (e) {
        throw BuiltValueNestedFieldError(
            r'FareUpdateInputDto', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
