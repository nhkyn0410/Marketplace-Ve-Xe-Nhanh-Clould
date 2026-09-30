// GENERATED CODE - DO NOT MODIFY BY HAND

part of 'trip_response_dto_output_stops_inner.dart';

// **************************************************************************
// BuiltValueGenerator
// **************************************************************************

const TripResponseDtoOutputStopsInnerRoleEnum
    _$tripResponseDtoOutputStopsInnerRoleEnum_ORIGIN =
    const TripResponseDtoOutputStopsInnerRoleEnum._('ORIGIN');
const TripResponseDtoOutputStopsInnerRoleEnum
    _$tripResponseDtoOutputStopsInnerRoleEnum_INTERMEDIATE =
    const TripResponseDtoOutputStopsInnerRoleEnum._('INTERMEDIATE');
const TripResponseDtoOutputStopsInnerRoleEnum
    _$tripResponseDtoOutputStopsInnerRoleEnum_DESTINATION =
    const TripResponseDtoOutputStopsInnerRoleEnum._('DESTINATION');

TripResponseDtoOutputStopsInnerRoleEnum
    _$tripResponseDtoOutputStopsInnerRoleEnumValueOf(String name) {
  switch (name) {
    case 'ORIGIN':
      return _$tripResponseDtoOutputStopsInnerRoleEnum_ORIGIN;
    case 'INTERMEDIATE':
      return _$tripResponseDtoOutputStopsInnerRoleEnum_INTERMEDIATE;
    case 'DESTINATION':
      return _$tripResponseDtoOutputStopsInnerRoleEnum_DESTINATION;
    default:
      throw ArgumentError(name);
  }
}

final BuiltSet<TripResponseDtoOutputStopsInnerRoleEnum>
    _$tripResponseDtoOutputStopsInnerRoleEnumValues = BuiltSet<
        TripResponseDtoOutputStopsInnerRoleEnum>(const <TripResponseDtoOutputStopsInnerRoleEnum>[
  _$tripResponseDtoOutputStopsInnerRoleEnum_ORIGIN,
  _$tripResponseDtoOutputStopsInnerRoleEnum_INTERMEDIATE,
  _$tripResponseDtoOutputStopsInnerRoleEnum_DESTINATION,
]);

Serializer<TripResponseDtoOutputStopsInnerRoleEnum>
    _$tripResponseDtoOutputStopsInnerRoleEnumSerializer =
    _$TripResponseDtoOutputStopsInnerRoleEnumSerializer();

class _$TripResponseDtoOutputStopsInnerRoleEnumSerializer
    implements PrimitiveSerializer<TripResponseDtoOutputStopsInnerRoleEnum> {
  static const Map<String, Object> _toWire = const <String, Object>{
    'ORIGIN': 'ORIGIN',
    'INTERMEDIATE': 'INTERMEDIATE',
    'DESTINATION': 'DESTINATION',
  };
  static const Map<Object, String> _fromWire = const <Object, String>{
    'ORIGIN': 'ORIGIN',
    'INTERMEDIATE': 'INTERMEDIATE',
    'DESTINATION': 'DESTINATION',
  };

  @override
  final Iterable<Type> types = const <Type>[
    TripResponseDtoOutputStopsInnerRoleEnum
  ];
  @override
  final String wireName = 'TripResponseDtoOutputStopsInnerRoleEnum';

  @override
  Object serialize(Serializers serializers,
          TripResponseDtoOutputStopsInnerRoleEnum object,
          {FullType specifiedType = FullType.unspecified}) =>
      _toWire[object.name] ?? object.name;

  @override
  TripResponseDtoOutputStopsInnerRoleEnum deserialize(
          Serializers serializers, Object serialized,
          {FullType specifiedType = FullType.unspecified}) =>
      TripResponseDtoOutputStopsInnerRoleEnum.valueOf(
          _fromWire[serialized] ?? (serialized is String ? serialized : ''));
}

class _$TripResponseDtoOutputStopsInner
    extends TripResponseDtoOutputStopsInner {
  @override
  final int sequence;
  @override
  final TripResponseDtoOutputStopsInnerRoleEnum role;
  @override
  final String? catalogStopPointId;
  @override
  final String? stopPointId;
  @override
  final String name;
  @override
  final String address;
  @override
  final DateTime plannedAt;
  @override
  final String? note;

  factory _$TripResponseDtoOutputStopsInner(
          [void Function(TripResponseDtoOutputStopsInnerBuilder)? updates]) =>
      (TripResponseDtoOutputStopsInnerBuilder()..update(updates))._build();

  _$TripResponseDtoOutputStopsInner._(
      {required this.sequence,
      required this.role,
      this.catalogStopPointId,
      this.stopPointId,
      required this.name,
      required this.address,
      required this.plannedAt,
      this.note})
      : super._();
  @override
  TripResponseDtoOutputStopsInner rebuild(
          void Function(TripResponseDtoOutputStopsInnerBuilder) updates) =>
      (toBuilder()..update(updates)).build();

  @override
  TripResponseDtoOutputStopsInnerBuilder toBuilder() =>
      TripResponseDtoOutputStopsInnerBuilder()..replace(this);

  @override
  bool operator ==(Object other) {
    if (identical(other, this)) return true;
    return other is TripResponseDtoOutputStopsInner &&
        sequence == other.sequence &&
        role == other.role &&
        catalogStopPointId == other.catalogStopPointId &&
        stopPointId == other.stopPointId &&
        name == other.name &&
        address == other.address &&
        plannedAt == other.plannedAt &&
        note == other.note;
  }

  @override
  int get hashCode {
    var _$hash = 0;
    _$hash = $jc(_$hash, sequence.hashCode);
    _$hash = $jc(_$hash, role.hashCode);
    _$hash = $jc(_$hash, catalogStopPointId.hashCode);
    _$hash = $jc(_$hash, stopPointId.hashCode);
    _$hash = $jc(_$hash, name.hashCode);
    _$hash = $jc(_$hash, address.hashCode);
    _$hash = $jc(_$hash, plannedAt.hashCode);
    _$hash = $jc(_$hash, note.hashCode);
    _$hash = $jf(_$hash);
    return _$hash;
  }

  @override
  String toString() {
    return (newBuiltValueToStringHelper(r'TripResponseDtoOutputStopsInner')
          ..add('sequence', sequence)
          ..add('role', role)
          ..add('catalogStopPointId', catalogStopPointId)
          ..add('stopPointId', stopPointId)
          ..add('name', name)
          ..add('address', address)
          ..add('plannedAt', plannedAt)
          ..add('note', note))
        .toString();
  }
}

class TripResponseDtoOutputStopsInnerBuilder
    implements
        Builder<TripResponseDtoOutputStopsInner,
            TripResponseDtoOutputStopsInnerBuilder> {
  _$TripResponseDtoOutputStopsInner? _$v;

  int? _sequence;
  int? get sequence => _$this._sequence;
  set sequence(int? sequence) => _$this._sequence = sequence;

  TripResponseDtoOutputStopsInnerRoleEnum? _role;
  TripResponseDtoOutputStopsInnerRoleEnum? get role => _$this._role;
  set role(TripResponseDtoOutputStopsInnerRoleEnum? role) =>
      _$this._role = role;

  String? _catalogStopPointId;
  String? get catalogStopPointId => _$this._catalogStopPointId;
  set catalogStopPointId(String? catalogStopPointId) =>
      _$this._catalogStopPointId = catalogStopPointId;

  String? _stopPointId;
  String? get stopPointId => _$this._stopPointId;
  set stopPointId(String? stopPointId) => _$this._stopPointId = stopPointId;

  String? _name;
  String? get name => _$this._name;
  set name(String? name) => _$this._name = name;

  String? _address;
  String? get address => _$this._address;
  set address(String? address) => _$this._address = address;

  DateTime? _plannedAt;
  DateTime? get plannedAt => _$this._plannedAt;
  set plannedAt(DateTime? plannedAt) => _$this._plannedAt = plannedAt;

  String? _note;
  String? get note => _$this._note;
  set note(String? note) => _$this._note = note;

  TripResponseDtoOutputStopsInnerBuilder() {
    TripResponseDtoOutputStopsInner._defaults(this);
  }

  TripResponseDtoOutputStopsInnerBuilder get _$this {
    final $v = _$v;
    if ($v != null) {
      _sequence = $v.sequence;
      _role = $v.role;
      _catalogStopPointId = $v.catalogStopPointId;
      _stopPointId = $v.stopPointId;
      _name = $v.name;
      _address = $v.address;
      _plannedAt = $v.plannedAt;
      _note = $v.note;
      _$v = null;
    }
    return this;
  }

  @override
  void replace(TripResponseDtoOutputStopsInner other) {
    _$v = other as _$TripResponseDtoOutputStopsInner;
  }

  @override
  void update(void Function(TripResponseDtoOutputStopsInnerBuilder)? updates) {
    if (updates != null) updates(this);
  }

  @override
  TripResponseDtoOutputStopsInner build() => _build();

  _$TripResponseDtoOutputStopsInner _build() {
    final _$result = _$v ??
        _$TripResponseDtoOutputStopsInner._(
          sequence: BuiltValueNullFieldError.checkNotNull(
              sequence, r'TripResponseDtoOutputStopsInner', 'sequence'),
          role: BuiltValueNullFieldError.checkNotNull(
              role, r'TripResponseDtoOutputStopsInner', 'role'),
          catalogStopPointId: catalogStopPointId,
          stopPointId: stopPointId,
          name: BuiltValueNullFieldError.checkNotNull(
              name, r'TripResponseDtoOutputStopsInner', 'name'),
          address: BuiltValueNullFieldError.checkNotNull(
              address, r'TripResponseDtoOutputStopsInner', 'address'),
          plannedAt: BuiltValueNullFieldError.checkNotNull(
              plannedAt, r'TripResponseDtoOutputStopsInner', 'plannedAt'),
          note: note,
        );
    replace(_$result);
    return _$result;
  }
}

// ignore_for_file: deprecated_member_use_from_same_package,type=lint
