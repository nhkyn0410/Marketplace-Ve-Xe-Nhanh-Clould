// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'fare_response_dto_output.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const FareResponseDtoOutputStatusEnum _$fareResponseDtoOutputStatusEnum_ACTIVE =
    const FareResponseDtoOutputStatusEnum._('ACTIVE');
const FareResponseDtoOutputStatusEnum
    _$fareResponseDtoOutputStatusEnum_INACTIVE =
    const FareResponseDtoOutputStatusEnum._('INACTIVE');

FareResponseDtoOutputStatusEnum _$fareResponseDtoOutputStatusEnumValueOf(
    String name) {
  switch (name) {
    case 'ACTIVE':
      return _$fareResponseDtoOutputStatusEnum_ACTIVE;
    case 'INACTIVE':
      return _$fareResponseDtoOutputStatusEnum_INACTIVE;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<FareResponseDtoOutputStatusEnum>
    _$fareResponseDtoOutputStatusEnumValues = BuiltSet<
        FareResponseDtoOutputStatusEnum>(const <FareResponseDtoOutputStatusEnum>[
  _$fareResponseDtoOutputStatusEnum_ACTIVE,
  _$fareResponseDtoOutputStatusEnum_INACTIVE,
]);

Serializer<FareResponseDtoOutputStatusEnum>
    _$fareResponseDtoOutputStatusEnumSerializer =
    _$FareResponseDtoOutputStatusEnumSerializer();

class _$FareResponseDtoOutputStatusEnumSerializer
    implements PrimitiveSerializer<FareResponseDtoOutputStatusEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ACTIVE': 'ACTIVE',
    'INACTIVE': 'INACTIVE',
  };

  @override
  final Iterable<Type> types = const <Type>[FareResponseDtoOutputStatusEnum];
  @override
  final String wireName = 'FareResponseDtoOutputStatusEnum';

  @override
  Object serialize(
          Serializers serializers, FareResponseDtoOutputStatusEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  FareResponseDtoOutputStatusEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      FareResponseDtoOutputStatusEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$FareResponseDtoOutput extends FareResponseDtoOutput {
  @override
  final String id;
  @override
  final String routeId;
  @override
  final String routeName;
  @override
  final FareResponseDtoOutputStatusEnum status;
  @override
  final DateTime createdAt;
  @override
  final DateTime updatedAt;
  @override
  final String? note;
  @override
  final BuiltList<FareResponseDtoOutputRulesInner> rules;

  factory _$FareResponseDtoOutput(
          [void Function(FareResponseDtoOutputBuilder)? updates]) =>
      (FareResponseDtoOutputBuilder()..update(updates))._build();

  _$FareResponseDtoOutput._(
      {required this.id,
      required this.routeId,
      required this.routeName,
      required this.status,
      required this.createdAt,
      required this.updatedAt,
      this.note,
      required this.rules})
      : super._();
  @override
  FareResponseDtoOutput rebuild(
          void Function(FareResponseDtoOutputBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  FareResponseDtoOutputBuilder toBuilder() =>
      FareResponseDtoOutputBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is FareResponseDtoOutput &&
        id == other.id &&
        routeId == other.routeId &&
        routeName == other.routeName &&
        status == other.status &&
        createdAt == other.createdAt &&
        updatedAt == other.updatedAt &&
        note == other.note &&
        rules == other.rules;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, id.hashCode);
    _$hash = $jc(_$hash, routeId.hashCode);
    _$hash = $jc(_$hash, routeName.hashCode);
    _$hash = $jc(_$hash, status.hashCode);
    _$hash = $jc(_$hash, createdAt.hashCode);
    _$hash = $jc(_$hash, updatedAt.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jc(_$hash, rules.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'FareResponseDtoOutput')
          ..add('id', id)
          ..add('routeId', routeId)
          ..add('routeName', routeName)
          ..add('status', status)
          ..add('createdAt', createdAt)
          ..add('updatedAt', updatedAt)
          ..add('note', note)
          ..add('rules', rules))
        .toString();
  }
}

class FareResponseDtoOutputBuilder
    implements Builder<FareResponseDtoOutput, FareResponseDtoOutputBuilder> {
  _$FareResponseDtoOutput? _$v;

  String? _id;
  String? get id => _$this._id;
  set id(String? id) => _$this._id = id;

  String? _routeId;
  String? get routeId => _$this._routeId;
  set routeId(String? routeId) => _$this._routeId = routeId;

  String? _routeName;
  String? get routeName => _$this._routeName;
  set routeName(String? routeName) => _$this._routeName = routeName;

  FareResponseDtoOutputStatusEnum? _status;
  FareResponseDtoOutputStatusEnum? get status => _$this._status;
  set status(FareResponseDtoOutputStatusEnum? status) =>
      _$this._status = status;

  DateTime? _createdAt;
  DateTime? get createdAt => _$this._createdAt;
  set createdAt(DateTime? createdAt) => _$this._createdAt = createdAt;

  DateTime? _updatedAt;
  DateTime? get updatedAt => _$this._updatedAt;
  set updatedAt(DateTime? updatedAt) => _$this._updatedAt = updatedAt;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  ListBuilder<FareResponseDtoOutputRulesInner>? _rules;
  ListBuilder<FareResponseDtoOutputRulesInner> get rules =>
      _$this._rules ??= ListBuilder<FareResponseDtoOutputRulesInner>();
  set rules(ListBuilder<FareResponseDtoOutputRulesInner>? rules) =>
      _$this._rules = rules;

  FareResponseDtoOutputBuilder() {
    FareResponseDtoOutput._defaults(this);
  }

  FareResponseDtoOutputBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _id = $v.id;
      _routeId = $v.routeId;
      _routeName = $v.routeName;
      _status = $v.status;
      _createdAt = $v.createdAt;
      _updatedAt = $v.updatedAt;
      _note = $v.note;
      _rules = $v.rules.toBuilder();
      _$v = null;
    }
    return this;
  }

  @override
  void replace(FareResponseDtoOutput other) {
    _$v = other as _$FareResponseDtoOutput;
  }

  @override
  void update(void Function(FareResponseDtoOutputBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  FareResponseDtoOutput build() => _build();

  _$FareResponseDtoOutput _build() {
    _$FareResponseDtoOutput _$result;
    try {
      _$result = _$v ??
          _$FareResponseDtoOutput._(
            id: BuiltValueNullFieldError.checkNotNull(
                id, r'FareResponseDtoOutput', 'id'),
            routeId: BuiltValueNullFieldError.checkNotNull(
                routeId, r'FareResponseDtoOutput', 'routeId'),
            routeName: BuiltValueNullFieldError.checkNotNull(
                routeName, r'FareResponseDtoOutput', 'routeName'),
            status: BuiltValueNullFieldError.checkNotNull(
                status, r'FareResponseDtoOutput', 'status'),
            createdAt: BuiltValueNullFieldError.checkNotNull(
                createdAt, r'FareResponseDtoOutput', 'createdAt'),
            updatedAt: BuiltValueNullFieldError.checkNotNull(
                updatedAt, r'FareResponseDtoOutput', 'updatedAt'),
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
            r'FareResponseDtoOutput', _$failedField, e.toString());
      }
      rethrow;
    }
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
